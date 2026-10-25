<?php
// Standalone integration smoke test; all database writes use disposable in-memory SQLite.
$root = getenv('CEYLONICA_APP_ROOT') ?: dirname(__DIR__, 2);
require $root . '/vendor/autoload.php';
$app = require $root . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:', 'database.connections.sqlite.url' => null]);
Illuminate\Support\Facades\DB::purge('sqlite');

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use App\Http\Controllers\RapidFireController;
use App\Http\Controllers\Api\BusinessSurveyQuestionController;

function check(bool $ok, string $message): void { if (!$ok) throw new RuntimeException($message); }
check(DB::connection()->getDatabaseName() === ':memory:', 'Refuse to test against stored data');
Schema::create('rapid_fire_sessions', function (Blueprint $t) { $t->uuid('id')->primary(); $t->string('contributor_sub'); });
Schema::create('village_topic_answers', function (Blueprint $t) {
    $t->id(); $t->uuid('session_id'); $t->string('contributor_sub'); $t->integer('category_id');
    $t->string('answer'); $t->integer('points')->default(20); $t->timestamps();
});
$session='11111111-1111-4111-8111-111111111111';
DB::table('rapid_fire_sessions')->insert(['id'=>$session,'contributor_sub'=>'tester']);
foreach ([[1,'tester','yes'],[2,'tester','no'],[3,'another-user','yes']] as [$id,$sub,$answer]) {
    DB::table('village_topic_answers')->insert(['session_id'=>$session,'category_id'=>$id,'contributor_sub'=>$sub,'answer'=>$answer]);
}
$migration=require $root.'/database/migrations/2026_10_11_000001_add_quantity_to_village_topic_answers.php';
$controller=$app->make(RapidFireController::class);
$legacyRequest=Request::create('/counts','POST',['counts'=>[['category_id'=>1,'count'=>7]]]);
$legacyRequest->attributes->set('keycloak_sub','tester');
$before=DB::table('village_topic_answers')->get()->toJson();
check($controller->counts($legacyRequest,$session)->getStatusCode()===503,'Unmigrated schema must reject count writes cleanly');
check(DB::table('village_topic_answers')->get()->toJson()===$before,'Unavailable counts must not change answers');
$rules=new ReflectionMethod(RapidFireController::class,'rules');
check($rules->invoke($controller)['counts_enabled']===false,'Unmigrated schema must hide count offer');
$migration->up();
check($rules->invoke($controller)['counts_enabled']===true,'Migrated local schema must enable counts');
check(DB::table('village_topic_answers')->count()===3 && DB::table('village_topic_answers')->whereNotNull('quantity')->count()===0, 'Migration must preserve existing answers');
$controller=$app->make(RapidFireController::class);
$request=Request::create('/counts','POST',['counts'=>[['category_id'=>1,'count'=>7],['category_id'=>2,'count'=>8],['category_id'=>3,'count'=>9]]]);
$request->attributes->set('keycloak_sub','tester');
$response=$controller->counts($request,$session);
check($response->getStatusCode()===200 && $response->getData(true)['data']['saved']===1,'Only own yes answer can receive count');
check(DB::table('village_topic_answers')->where('category_id',1)->value('quantity')===7,'Count is stored');
check(DB::table('village_topic_answers')->whereIn('category_id',[2,3])->whereNotNull('quantity')->count()===0,'Other users and no answers unchanged');
check(DB::table('village_topic_answers')->sum('points')===60,'Counts must not award points');
$request->attributes->set('keycloak_sub','another-user');
check($controller->counts($request,$session)->getStatusCode()===403,'Other user cannot edit round');
$request->attributes->set('keycloak_sub','tester');
check($controller->counts($request,'invalid')->getStatusCode()===404,'Invalid session is rejected');
$bad=Request::create('/counts','POST',['counts'=>[['category_id'=>1,'count'=>0]]]);
$bad->attributes->set('keycloak_sub','tester');
try { $controller->counts($bad,$session); throw new RuntimeException('Zero count accepted'); }
catch (Illuminate\Validation\ValidationException $e) { check(isset($e->errors()['counts.0.count']),'Count range validation missing'); }

foreach (['2026_08_26_161337_create_business_survey_questions_table.php','2026_08_27_014848_add_explanation_fields_to_business_survey_questions_table.php','2026_09_11_002007_add_explanation_image_to_business_survey_questions_table.php'] as $file) {
    (require $root.'/database/migrations/'.$file)->up();
}
$editor=$app->make(BusinessSurveyQuestionController::class);
foreach ([14,15] as $step) {
    $q=Request::create('/questions','POST',['step_index'=>$step,'field_key'=>'integration_step_'.$step,'type'=>'text','question_en'=>'Test question']);
    check($editor->store($q)->getStatusCode()===201,'New survey step cannot save a question');
}
try {
    $editor->store(Request::create('/questions','POST',['step_index'=>16,'field_key'=>'unreachable','type'=>'text','question_en'=>'Test']));
    throw new RuntimeException('Unreachable survey step accepted');
} catch (Illuminate\Validation\ValidationException $e) { check(isset($e->errors()['step_index']),'Survey step validation missing'); }
echo "PASS: nullable migration, count persistence/ownership/validation, unchanged scoring, and survey steps 14/15 (SQLite memory only).\n";

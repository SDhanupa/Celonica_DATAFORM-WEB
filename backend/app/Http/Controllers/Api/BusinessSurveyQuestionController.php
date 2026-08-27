<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\BusinessSurveyQuestion;
use Illuminate\Http\JsonResponse;

class BusinessSurveyQuestionController extends Controller
{
    public function index(): JsonResponse
    {
        $questions = BusinessSurveyQuestion::where('is_active', true)
            ->orderBy('step_index')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $questions
        ]);
    }
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'step_index' => 'required|integer',
            'field_key' => 'required|string|unique:business_survey_questions',
            'type' => 'required|string',
            'question_en' => 'nullable|string',
            'question_si' => 'nullable|string',
            'question_ta' => 'nullable|string',
            'explanation_en' => 'nullable|string',
            'explanation_si' => 'nullable|string',
            'explanation_ta' => 'nullable|string',
            'options_json' => 'nullable|array',
            'depends_on' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer'
        ]);

        $question = BusinessSurveyQuestion::create($validated);

        return response()->json([
            'success' => true,
            'data' => $question
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $question = BusinessSurveyQuestion::findOrFail($id);

        $validated = $request->validate([
            'step_index' => 'integer',
            'field_key' => 'string|unique:business_survey_questions,field_key,'.$question->id,
            'type' => 'string',
            'question_en' => 'nullable|string',
            'question_si' => 'nullable|string',
            'question_ta' => 'nullable|string',
            'explanation_en' => 'nullable|string',
            'explanation_si' => 'nullable|string',
            'explanation_ta' => 'nullable|string',
            'options_json' => 'nullable|array',
            'depends_on' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer'
        ]);

        $question->update($validated);

        return response()->json([
            'success' => true,
            'data' => $question
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $question = BusinessSurveyQuestion::findOrFail($id);
        $question->delete();

        return response()->json([
            'success' => true
        ]);
    }
}

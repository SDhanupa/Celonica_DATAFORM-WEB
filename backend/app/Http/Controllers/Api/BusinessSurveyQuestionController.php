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

        // Append full URL for image
        $questions->transform(function ($q) {
            if ($q->explanation_image) {
                $q->explanation_image_url = asset('storage/' . $q->explanation_image);
            }
            return $q;
        });

        return response()->json([
            'success' => true,
            'data' => $questions
        ]);
    }
    
    private function processFormData(Request $request): array
    {
        $validated = $request->validate([
            'step_index' => 'required|integer',
            'field_key' => 'required|string',
            'type' => 'required|string',
            'question_en' => 'nullable|string',
            'question_si' => 'nullable|string',
            'question_ta' => 'nullable|string',
            'explanation_en' => 'nullable|string',
            'explanation_si' => 'nullable|string',
            'explanation_ta' => 'nullable|string',
            'options_json' => 'nullable', // string or array
            'depends_on' => 'nullable|string',
            'is_active' => 'nullable',
            'sort_order' => 'integer',
            'explanation_image' => 'nullable|image|max:5120', // 5MB max
        ]);

        if (isset($validated['options_json']) && is_string($validated['options_json'])) {
            $validated['options_json'] = json_decode($validated['options_json'], true);
        }

        if (isset($validated['is_active']) && is_string($validated['is_active'])) {
            $validated['is_active'] = filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('explanation_image')) {
            $validated['explanation_image'] = $request->file('explanation_image')->store('question_images', 'public');
        }

        return $validated;
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'field_key' => 'unique:business_survey_questions'
        ]);

        $validated = $this->processFormData($request);
        $question = BusinessSurveyQuestion::create($validated);

        if ($question->explanation_image) {
            $question->explanation_image_url = asset('storage/' . $question->explanation_image);
        }

        return response()->json([
            'success' => true,
            'data' => $question
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $question = BusinessSurveyQuestion::findOrFail($id);

        $request->validate([
            'field_key' => 'unique:business_survey_questions,field_key,'.$question->id
        ]);

        $validated = $this->processFormData($request);
        $question->update($validated);

        if ($question->explanation_image) {
            $question->explanation_image_url = asset('storage/' . $question->explanation_image);
        }

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

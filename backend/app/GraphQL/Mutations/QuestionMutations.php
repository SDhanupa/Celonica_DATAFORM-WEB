<?php

namespace App\GraphQL\Mutations;

use App\Models\Question;
use App\Models\UserAnswer;
use GraphQL\Error\Error;

final class QuestionMutations
{
    /**
     * Create a new question (Admin only)
     */
    public function createQuestion(mixed $root, array $args)
    {
        $this->ensureAdmin();

        return Question::create([
            'category_id' => $args['category_id'] ?? null,
            'section' => $args['section'] ?? null,
            'question_text_en' => $args['question_text_en'],
            'question_text_si' => $args['question_text_si'] ?? null,
            'input_type' => $args['input_type'],
            'is_repeater' => $args['is_repeater'] ?? false,
            'sort_order' => $args['sort_order'],
            'is_active' => true,
        ]);
    }

    /**
     * Update a question (Admin only)
     */
    public function updateQuestion($_, array $args)
    {
        $this->ensureAdmin();
        $question = Question::findOrFail($args['id']);
        $question->update($args);
        return $question;
    }

    public function deleteQuestion($_, array $args)
    {
        $this->ensureAdmin();
        $question = Question::findOrFail($args['id']);
        return $question->delete();
    }

    /**
     * Answer a question (User only)
     */
    public function answerQuestion(mixed $root, array $args)
    {
        $user = request()->get('current_user');
        
        if (!$user) {
            throw new Error('Unauthorized. Only users can answer questions.');
        }

        $answer = UserAnswer::updateOrCreate(
            [
                'user_id' => $user->id,
                'question_id' => $args['questionId'],
                'iteration' => $args['iteration'] ?? 1
            ],
            [
                'answer_value' => $args['answerValue'] ?? null,
                'is_skipped' => $args['isSkipped'] ?? false,
            ]
        );

        return $answer;
    }

    private function ensureAdmin()
    {
        $admin = request()->get('current_admin');
        if (!$admin) {
            throw new Error('Unauthorized. Only admins can perform this action.');
        }
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminRapidFireApprovalsController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->attributes->get('current_admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $status = $request->query('status', 'pending');
        
        $answers = DB::table('village_topic_answers as vta')
            ->leftJoin('users', 'users.keycloak_sub', '=', 'vta.contributor_sub')
            ->join('categories', 'categories.id', '=', 'vta.category_id')
            ->leftJoin('grama_niladharis', 'grama_niladharis.CCODE', '=', 'vta.ccode')
            ->select(
                'vta.id',
                'vta.ccode',
                'grama_niladharis.name_en as gn_name',
                'vta.contributor_sub',
                'users.name as user_name',
                'users.email as user_email',
                'categories.name_en as category_name',
                'vta.answer',
                'vta.status',
                'vta.created_at'
            )
            ->where('vta.status', $status)
            ->orderBy('vta.ccode')
            ->orderBy('vta.contributor_sub')
            ->orderBy('vta.created_at', 'desc')
            ->get();
            
        \Log::info('Admin Rapid Fire Fetched:', ['count' => count($answers), 'admin' => $request->attributes->get('current_admin')->email ?? 'unknown', 'status' => $status]);
            
        return response()->json(['success' => true, 'data' => $answers]);
    }
    
    public function updateStatus(Request $request)
    {
        if (!$request->attributes->get('current_admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
            'status' => ['required', 'string', 'in:approved,rejected,pending']
        ]);
        
        DB::table('village_topic_answers')
            ->whereIn('id', $data['ids'])
            ->update(['status' => $data['status'], 'updated_at' => now()]);
            
        return response()->json(['success' => true]);
    }
}

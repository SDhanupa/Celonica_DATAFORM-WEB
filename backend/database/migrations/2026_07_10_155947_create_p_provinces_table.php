<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('p_province', function (Blueprint $table) {
            $table->id();
            $table->string('admin1Name_en')->nullable();
            $table->string('admin1Name_si')->nullable();
            $table->string('admin1Name_ta')->nullable();
            $table->string('admin1Pcode')->nullable();
            $table->string('admin0Name_en')->nullable();
            $table->string('admin0Name_si')->nullable();
            $table->string('admin0Name_ta')->nullable();
            $table->string('admin0Pcode')->nullable();
            $table->integer('P_65plus')->default(0);
            $table->integer('P_60_69')->default(0);
            $table->integer('P_70_79')->default(0);
            $table->integer('P_80plus')->default(0);
            $table->integer('F_65plus')->default(0);
            $table->integer('F_60_69')->default(0);
            $table->integer('F_70_79')->default(0);
            $table->integer('F_80plus')->default(0);
            $table->integer('F_15_49')->default(0);
            $table->integer('M_65plus')->default(0);
            $table->integer('M_60_69')->default(0);
            $table->integer('M_70_79')->default(0);
            $table->integer('M_80plus')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('p_province');
    }
};

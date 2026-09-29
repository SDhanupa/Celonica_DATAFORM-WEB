<?php Schema::table('industry_surveys', function ($table) { $table->string('status')->default('draft')->after('longitude'); });

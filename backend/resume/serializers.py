from rest_framework import serializers
from .models import ResumeApplication


class ResumeApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeApplication
        fields = ['id', 'company_name', 'role', 'status', 'resume', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

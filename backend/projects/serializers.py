from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'status', 'tech_stack', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']

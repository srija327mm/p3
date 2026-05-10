from rest_framework import serializers
from .models import Learning


class LearningSerializer(serializers.ModelSerializer):
    class Meta:
        model = Learning
        fields = ['id', 'topic', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

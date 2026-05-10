from rest_framework import serializers
from .models import Drawing


class DrawingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drawing
        fields = ['id', 'name', 'data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

from rest_framework import serializers
from .models import EnglishEntry


class EnglishEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = EnglishEntry
        fields = ['id', 'day', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

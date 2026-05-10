from rest_framework import serializers
from .models import PasswordEntry


class PasswordEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = PasswordEntry
        fields = ['id', 'name', 'password', 'mail', 'url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

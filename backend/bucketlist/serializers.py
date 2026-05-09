from rest_framework import serializers
from .models import BucketItem


class BucketItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BucketItem
        fields = ['id', 'text', 'done', 'created_at']
        read_only_fields = ['id', 'created_at']

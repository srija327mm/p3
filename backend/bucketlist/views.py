from rest_framework import generics
from .models import BucketItem
from .serializers import BucketItemSerializer


class BucketItemListCreateView(generics.ListCreateAPIView):
    queryset = BucketItem.objects.all()
    serializer_class = BucketItemSerializer


class BucketItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BucketItem.objects.all()
    serializer_class = BucketItemSerializer

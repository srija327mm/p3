from rest_framework import generics
from .models import Learning
from .serializers import LearningSerializer


class LearningListCreateView(generics.ListCreateAPIView):
    queryset = Learning.objects.all()
    serializer_class = LearningSerializer


class LearningDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Learning.objects.all()
    serializer_class = LearningSerializer

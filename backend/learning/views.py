from rest_framework import generics
from .models import Learning
from .serializers import LearningSerializer


class LearningListCreateView(generics.ListCreateAPIView):
    serializer_class = LearningSerializer

    def get_queryset(self):
        return Learning.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LearningDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LearningSerializer

    def get_queryset(self):
        return Learning.objects.filter(user=self.request.user)

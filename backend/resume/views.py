from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import ResumeApplication
from .serializers import ResumeApplicationSerializer


class ResumeListCreateView(generics.ListCreateAPIView):
    serializer_class = ResumeApplicationSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return ResumeApplication.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ResumeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ResumeApplicationSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return ResumeApplication.objects.filter(user=self.request.user)

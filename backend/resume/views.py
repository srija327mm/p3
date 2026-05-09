from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import ResumeApplication
from .serializers import ResumeApplicationSerializer


class ResumeListCreateView(generics.ListCreateAPIView):
    queryset = ResumeApplication.objects.all()
    serializer_class = ResumeApplicationSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class ResumeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ResumeApplication.objects.all()
    serializer_class = ResumeApplicationSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

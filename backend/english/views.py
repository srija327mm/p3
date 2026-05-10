from rest_framework import generics
from .models import EnglishEntry
from .serializers import EnglishEntrySerializer


class EnglishEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = EnglishEntrySerializer

    def get_queryset(self):
        return EnglishEntry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EnglishEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EnglishEntrySerializer

    def get_queryset(self):
        return EnglishEntry.objects.filter(user=self.request.user)

from rest_framework import generics
from .models import PasswordEntry
from .serializers import PasswordEntrySerializer


class PasswordEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = PasswordEntrySerializer

    def get_queryset(self):
        return PasswordEntry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PasswordEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PasswordEntrySerializer

    def get_queryset(self):
        return PasswordEntry.objects.filter(user=self.request.user)

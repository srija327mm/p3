from django.conf import settings
from django.db import models


class EnglishEntry(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='english_entries',
        null=True,
        blank=True,
    )
    day = models.DateField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-day', '-created_at']

    def __str__(self):
        return f"{self.day}"

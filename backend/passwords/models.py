from django.db import models


class PasswordEntry(models.Model):
    name = models.CharField(max_length=200)
    password = models.CharField(max_length=500, blank=True, default='')
    mail = models.EmailField(blank=True, default='')
    url = models.URLField(max_length=500, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

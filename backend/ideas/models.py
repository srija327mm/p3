from django.conf import settings
from django.db import models


class Idea(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
        ('archived', 'Archived'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ideas',
        null=True,
        blank=True,
    )
    idea = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.FileField(upload_to='ideas/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.idea

from django.conf import settings
from django.db import models


class ResumeApplication(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('interviewing', 'Interviewing'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
        ('saved', 'Saved'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resume_applications',
        null=True,
        blank=True,
    )
    company_name = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.company_name} - {self.role}"

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ResumeApplication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('company_name', models.CharField(max_length=200)),
                ('role', models.CharField(max_length=200)),
                ('status', models.CharField(
                    choices=[
                        ('applied', 'Applied'),
                        ('interviewing', 'Interviewing'),
                        ('offer', 'Offer'),
                        ('rejected', 'Rejected'),
                        ('saved', 'Saved'),
                    ],
                    default='applied',
                    max_length=20,
                )),
                ('resume', models.FileField(blank=True, null=True, upload_to='resumes/')),
                ('description', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]

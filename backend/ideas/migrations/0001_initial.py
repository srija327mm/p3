from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Idea',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('idea', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('image', models.FileField(blank=True, null=True, upload_to='ideas/')),
                ('status', models.CharField(
                    choices=[
                        ('new', 'New'),
                        ('in_progress', 'In Progress'),
                        ('done', 'Done'),
                        ('archived', 'Archived'),
                    ],
                    default='new',
                    max_length=20,
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]

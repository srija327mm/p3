from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('status', models.CharField(
                    blank=True,
                    choices=[
                        ('planning', 'Planning'),
                        ('in_progress', 'In Progress'),
                        ('completed', 'Completed'),
                        ('on_hold', 'On Hold'),
                        ('archived', 'Archived'),
                    ],
                    default='',
                    max_length=20,
                )),
                ('tech_stack', models.CharField(blank=True, default='', max_length=500)),
                ('notes', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]

# Generated for Book Bank backend students app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='StudentProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('enrollment_number', models.CharField(db_index=True, max_length=50, unique=True)),
                ('date_of_birth', models.DateField(blank=True, null=True)),
                ('department', models.CharField(blank=True, max_length=255)),
                ('year_of_study', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('parent_name', models.CharField(blank=True, max_length=255)),
                ('address', models.TextField(blank=True)),
                ('state', models.CharField(blank=True, max_length=100)),
                ('pin_code', models.CharField(blank=True, max_length=10)),
                ('borrowing_limit', models.PositiveSmallIntegerField(default=3)),
                ('is_active', models.BooleanField(default=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='student_profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('document_type', models.CharField(choices=[('id_card', 'ID Card'), ('enrollment_proof', 'Enrollment Proof'), ('address_proof', 'Address Proof'), ('other', 'Other')], default='other', max_length=30)),
                ('file', models.FileField(upload_to='documents/%Y/%m/')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('notes', models.CharField(blank=True, max_length=255)),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='students.studentprofile')),
            ],
        ),
    ]


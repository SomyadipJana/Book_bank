# Generated for Book Bank backend fines app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('books', '0001_initial'),
        ('students', '0001_initial'),
        ('issues', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Fine',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('due_date', models.DateField()),
                ('return_date', models.DateField(blank=True, null=True)),
                ('days_late', models.PositiveIntegerField(default=0)),
                ('amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=8)),
                ('status', models.CharField(choices=[('unpaid', 'Unpaid'), ('paid', 'Paid'), ('waived', 'Waived')], default='unpaid', max_length=20)),
                ('paid_at', models.DateTimeField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='fines', to='books.book')),
                ('issue', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='fine', to='issues.issue')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='fines', to='students.studentprofile')),
                ('waived_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='waived_fines', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]


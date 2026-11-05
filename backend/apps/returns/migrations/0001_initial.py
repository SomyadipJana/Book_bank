# Generated for Book Bank backend returns app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('issues', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Return',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('return_date', models.DateField(auto_now_add=True)),
                ('condition_notes', models.TextField(blank=True)),
                ('was_late', models.BooleanField(default=False)),
                ('days_late', models.PositiveIntegerField(default=0)),
                ('issue', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, related_name='return_record', to='issues.issue')),
                ('returned_to', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='received_returns', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]


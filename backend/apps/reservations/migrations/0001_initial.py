# Generated for Book Bank backend reservations app

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('books', '0001_initial'),
        ('students', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Reservation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reserved_date', models.DateField(auto_now_add=True)),
                ('status', models.CharField(choices=[('waiting', 'Waiting in Queue'), ('ready', 'Ready for Pickup'), ('fulfilled', 'Fulfilled'), ('cancelled', 'Cancelled')], default='waiting', max_length=20)),
                ('queue_position', models.PositiveIntegerField(default=1)),
                ('notified_at', models.DateTimeField(blank=True, null=True)),
                ('pickup_deadline', models.DateField(blank=True, null=True)),
                ('pickup_location', models.CharField(default='Desk Bay 2 — Shelf R-04', max_length=255)),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reservations', to='books.book')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reservations', to='students.studentprofile')),
            ],
            options={
                'ordering': ['reserved_date', 'id'],
            },
        ),
    ]


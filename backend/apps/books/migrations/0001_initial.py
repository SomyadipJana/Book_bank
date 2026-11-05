# Generated for Book Bank backend books app

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('vendors', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Book',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('accession_number', models.CharField(db_index=True, max_length=20, unique=True)),
                ('title', models.CharField(max_length=512)),
                ('author', models.CharField(max_length=512)),
                ('isbn', models.CharField(blank=True, db_index=True, max_length=50, null=True)),
                ('edition', models.CharField(blank=True, max_length=100)),
                ('publisher', models.CharField(blank=True, max_length=255)),
                ('category', models.CharField(choices=[('Computer Science', 'Computer Science'), ('Engineering', 'Engineering'), ('Mathematics', 'Mathematics'), ('Algorithms & DS', 'Algorithms & DS'), ('Systems & OS', 'Systems & OS'), ('Networks', 'Networks'), ('Fiction', 'Fiction'), ('Psychology', 'Psychology'), ('Management', 'Management'), ('History', 'History'), ('Design', 'Design'), ('Reference', 'Reference'), ('Other', 'Other')], default='Other', max_length=50)),
                ('format', models.CharField(choices=[('Book', 'Book'), ('Magazine', 'Magazine'), ('Reference', 'Reference')], default='Book', max_length=20)),
                ('description', models.TextField(blank=True)),
                ('total_copies', models.PositiveIntegerField(default=1)),
                ('available_copies', models.PositiveIntegerField(default=1)),
                ('added_date', models.DateField(auto_now_add=True)),
                ('price', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('purchase_date', models.DateField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('cover_url', models.TextField(blank=True)),
                ('vendor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='books', to='vendors.vendor')),
            ],
            options={
                'ordering': ['title'],
            },
        ),
    ]


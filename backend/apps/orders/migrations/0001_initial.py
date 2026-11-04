# Generated for Book Bank backend orders app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('vendors', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='PurchaseOrder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed by Vendor'), ('supplied', 'Supplied'), ('completed', 'Completed / Added to Inventory')], default='pending', max_length=20)),
                ('order_date', models.DateField(auto_now_add=True)),
                ('expected_date', models.DateField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_orders', to=settings.AUTH_USER_MODEL)),
                ('vendor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='purchase_orders', to='vendors.vendor')),
            ],
            options={
                'ordering': ['-order_date', '-id'],
            },
        ),
        migrations.CreateModel(
            name='PurchaseOrderItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('book_title', models.CharField(max_length=512)),
                ('author', models.CharField(blank=True, max_length=512)),
                ('quantity', models.PositiveIntegerField(default=1)),
                ('unit_price', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('isbn_requested', models.CharField(blank=True, max_length=20)),
                ('notes', models.TextField(blank=True)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='orders.purchaseorder')),
            ],
        ),
    ]


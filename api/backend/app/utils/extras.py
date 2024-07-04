def calculate_change_rate(old_value, new_value):
    if old_value == 0:
        return 100 if new_value > 0 else 0
    change_rate = ((new_value - old_value) / old_value) * 100
    return round(change_rate, 2)

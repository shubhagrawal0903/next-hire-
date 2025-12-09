import os
import shutil

dir_path = r'd:\Java\jobapp\my-app\src\app\profile\[[...user_profile]]'

print(f'Attempting to delete: {dir_path}')

if os.path.exists(dir_path):
    try:
        shutil.rmtree(dir_path)
        print('✓ Successfully deleted the conflicting route directory!')
        print('✓ The routing error is now fixed.')
    except Exception as e:
        print(f'✗ Error: {e}')
        exit(1)
else:
    print(f'✗ Directory not found: {dir_path}')
    exit(1)

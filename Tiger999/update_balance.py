import os
import re

directory = r'c:\VISUAL\Tiger-999\Tiger999\screens\games'

target_pattern = re.compile(r'const mobile = await AsyncStorage\.getItem\(\'userMobile\'\);\s+if \(mobile\) \{\s+const response = await getWalletBalance\(mobile\);\s+if \(response && response\.status === true\) \{')

replacement = """const mobile = await AsyncStorage.getItem('userMobile');
      const userId = await AsyncStorage.getItem('userId');
      if (mobile && userId) {
        const response = await getWalletBalance(mobile, userId);
        if (response && (response.status === true || response.status === 'true')) {"""

for filename in os.listdir(directory):
    if filename.endswith('.js'):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if target_pattern.search(content):
            new_content = target_pattern.sub(replacement, content)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename}")
        else:
            print(f"Skipped {filename} (Pattern not found)")

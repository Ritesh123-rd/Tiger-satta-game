import os
import re

directory = r'c:\VISUAL\Tiger-999\Tiger999\screens\games'

# Pattern for imports
import_pattern = re.compile(r"import React, (\{ .* \}) from 'react';")
# Pattern for component start
component_start_pattern = re.compile(r"export default function (\w+)\(\{ navigation, route \}\) \{")
# Pattern for balance chip text
balance_chip_pattern = re.compile(r"<Text style={styles\.balanceText}>0\.0</Text>")

for filename in os.listdir(directory):
    if filename.endswith('.js'):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Skip if already updated (check for getWalletBalance call)
        if 'getWalletBalance' in content and 'userId' in content:
            # Need to check if it's the OLD version of fetchBalance
            if 'getWalletBalance(mobile)' in content:
                # Update it
                content = content.replace("getWalletBalance(mobile)", "getWalletBalance(mobile, userId)")
                content = content.replace("if (mobile) {", "const userId = await AsyncStorage.getItem('userId');\n      if (mobile && userId) {")
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Patched OLD fetchBalance in {filename}")
                continue
            else:
                print(f"Skipped {filename} (Already updated)")
                continue

        # Add imports if missing
        if "import AsyncStorage from '@react-native-async-storage/async-storage';" not in content:
            content = content.replace("import React,", "import AsyncStorage from '@react-native-async-storage/async-storage';\nimport { useFocusEffect } from '@react-navigation/native';\nimport { getWalletBalance } from '../../api/auth';\nimport React,")
        
        # Ensure useCallback is imported
        if 'useCallback' not in content:
            if 'useState' in content:
                content = content.replace('useState,', 'useState, useCallback,')
            else:
                content = content.replace('{', '{ useState, useCallback,')

        # Add balance state and fetchBalance
        fetch_balance_code = """  const [balance, setBalance] = useState(0.0);

  const fetchBalance = async () => {
    try {
      const mobile = await AsyncStorage.getItem('userMobile');
      const userId = await AsyncStorage.getItem('userId');
      if (mobile && userId) {
        const response = await getWalletBalance(mobile, userId);
        if (response && (response.status === true || response.status === 'true')) {
          setBalance(parseFloat(response.balance));
        }
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBalance();
    }, [])
  );

"""
        # Inject after route destruct or component start
        if 'const { gameName, gameCode } = route.params;' in content:
             content = content.replace('const { gameName, gameCode } = route.params;', 'const { gameName, gameCode } = route.params;\n' + fetch_balance_code)
        elif 'const { gameName, gameType } = route.params;' in content:
             content = content.replace('const { gameName, gameType } = route.params;', 'const { gameName, gameType } = route.params;\n' + fetch_balance_code)
        elif 'const { gameName } = route.params;' in content:
             content = content.replace('const { gameName } = route.params;', 'const { gameName } = route.params;\n' + fetch_balance_code)
        else:
             # Just after component start
             content = component_start_pattern.sub(r"export default function \1({ navigation, route }) {\n" + fetch_balance_code, content)

        # Update displays
        content = content.replace('>0.0</Text>', '>{balance.toFixed(1)}</Text>')

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fully Updated {filename}")

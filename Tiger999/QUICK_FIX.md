# Quick Fix Guide - TIGER 999 App

## 🚨 FIXING PlatformConstants Error

### ⚡ FASTEST FIX (One Command):

**Windows:**
```cmd
cd TIGER999 && taskkill /F /IM node.exe && rmdir /s /q node_modules && del package-lock.json && rmdir /s /q .expo && npm cache clean --force && npm install --legacy-peer-deps && npx expo start -c
```

**Mac/Linux:**
```bash
cd TIGER999 && killall node && rm -rf node_modules package-lock.json .expo && npm cache clean --force && npm install --legacy-peer-deps && npx expo start -c
```

---

## ✅ Current Setup - SDK 51 (STABLE!)

- **Expo:** SDK 51.0.28 ✅
- **React:** 18.2.0 
- **React Native:** 0.74.5
- **Status:** Most stable combination!

---

## 📱 Expo Go Version Needed

**Option 1:** Install SDK 51 Expo Go
- Android: https://expo.dev/go?sdkVersion=51&platform=android
- iOS: https://expo.dev/go?sdkVersion=51&platform=ios

**Option 2:** Use latest Expo Go (supports SDK 51)

---

## 🔧 Step-by-Step Fix

### 1. Stop Everything
```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux
killall node
```

### 2. Clean Project
```bash
cd TIGER999
rm -rf node_modules package-lock.json .expo
```

### 3. Clear Cache
```bash
npm cache clean --force
```

### 4. Install (IMPORTANT: Use --legacy-peer-deps!)
```bash
npm install --legacy-peer-deps
```

### 5. Start with Cache Clear
```bash
npx expo start -c
```

### 6. Close & Reopen Expo Go
- Completely close Expo Go app
- Reopen it
- Scan QR code

---

## ⚠️ Common Errors

### Error: "PlatformConstants could not be found"
**This is THE error you have!**

**Solution:**
```bash
rm -rf node_modules package-lock.json .expo ~/.expo
npm cache clean --force
npm install --legacy-peer-deps
npx expo start -c
```

Then:
1. Close Expo Go completely
2. Reopen Expo Go
3. Scan QR code again

### Error: "babel-preset-expo"
```bash
npm install --legacy-peer-deps
npx expo start -c
```

### Error: Metro bundler crash
```bash
killall node  # or taskkill /F /IM node.exe
npx expo start -c
```

---

## 💡 Why SDK 51?

SDK 54 has issues with TurboModuleRegistry causing PlatformConstants errors.

**SDK 51 is:**
- ✅ Stable
- ✅ Tested
- ✅ Works with current Expo Go
- ✅ No PlatformConstants errors

---

## 🎯 Installation Checklist

- [ ] Killed all node processes
- [ ] Deleted node_modules
- [ ] Deleted package-lock.json
- [ ] Deleted .expo folder
- [ ] Cleared npm cache
- [ ] Installed with `--legacy-peer-deps`
- [ ] Started with `-c` flag
- [ ] Closed Expo Go completely
- [ ] Reopened Expo Go fresh

---

## 🔥 Nuclear Option (Last Resort)

**Windows:**
```cmd
taskkill /F /IM node.exe
cd TIGER999
rmdir /s /q node_modules
del package-lock.json
rmdir /s /q .expo
rmdir /s /q %APPDATA%\npm-cache
rmdir /s /q %LOCALAPPDATA%\Expo
npm cache clean --force
npm cache verify
npm install --legacy-peer-deps
npx expo start -c --clear
```

**Mac/Linux:**
```bash
killall node
cd TIGER999
rm -rf node_modules package-lock.json .expo
rm -rf ~/.npm ~/.expo ~/Library/Caches/Expo
npm cache clean --force
npm cache verify
npm install --legacy-peer-deps
npx expo start -c --clear
```

Then close and reopen Expo Go!

---

## 📱 In Expo Go App

1. **Close completely** (swipe away from recent apps)
2. **Clear cache** (in Expo Go settings if needed)
3. **Reopen** Expo Go
4. **Scan** QR code
5. **Wait** for bundle to download

---

## ✅ Success Signs

You'll know it's working when:
1. ✅ No red error screen
2. ✅ Metro shows "Metro waiting..."
3. ✅ QR code visible in terminal
4. ✅ App opens in Expo Go
5. ✅ Login screen appears

---

## 🎉 You're Done!

When you see the **Login screen with phone input**, SUCCESS! 🚀

Press `r` to reload anytime.

---

**Important:** Always use `--legacy-peer-deps` when installing!

See **EMERGENCY_FIX.md** for more detailed troubleshooting.

Happy Coding! 🎊

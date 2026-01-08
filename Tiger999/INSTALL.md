# TIGER 999 App - Complete Installation Guide

## 🚀 ONE COMMAND INSTALL (Copy-Paste)

### Windows (CMD):
```cmd
cd TIGER999 && rmdir /s /q node_modules 2>nul && del /q package-lock.json 2>nul && npm cache clean --force && npm install && npx expo start -c
```

### Mac/Linux (Terminal):
```bash
cd TIGER999 && rm -rf node_modules package-lock.json && npm cache clean --force && npm install && npx expo start -c
```

---

## 📱 Step-by-Step (If Above Doesn't Work)

### Step 1: Navigate
```bash
cd TIGER999
```

### Step 2: Clean Everything
**Windows:**
```cmd
rmdir /s /q node_modules
del package-lock.json
rmdir /s /q .expo
```

**Mac/Linux:**
```bash
rm -rf node_modules package-lock.json .expo
```

### Step 3: Clear Cache
```bash
npm cache clean --force
```

### Step 4: Install
```bash
npm install
```

### Step 5: Start
```bash
npx expo start -c
```

---

## ✅ Current Configuration

- **Expo SDK 54** ✅ (Matches your Expo Go!)
- **React 18.3.1**
- **React Native 0.76.5**
- **React Navigation 7.x**

All versions perfectly compatible! 🎉

---

## ⚠️ Common Errors & Quick Fixes

### Error: "babel-preset-expo not found"
```bash
npm install
# If still error:
npm install expo@~54.0.0 --save
npm install
npx expo start -c
```

### Error: "PlatformConstants"
```bash
rm -rf node_modules package-lock.json .expo
npm cache clean --force
npm install
npx expo start -c
```

### Error: Metro bundler crash
**Windows:**
```cmd
taskkill /F /IM node.exe
npx expo start -c
```

**Mac/Linux:**
```bash
killall node
npx expo start -c
```

---

## 🎯 Testing on Phone

1. ✅ **Install Expo Go SDK 54** (you already have it!)
2. ✅ **Same WiFi** - Phone and computer
3. ✅ **Scan QR code** from terminal
4. ✅ **App loads!** 🎉

---

## 🔧 Troubleshooting Checklist

Before asking for help:
- [ ] Deleted `node_modules` folder
- [ ] Deleted `package-lock.json` file
- [ ] Deleted `.expo` folder
- [ ] Ran `npm cache clean --force`
- [ ] Ran `npm install` (without errors)
- [ ] Started with `npx expo start -c`
- [ ] Both devices on same WiFi
- [ ] Expo Go app is open and working

---

## 🔥 NUCLEAR OPTION (Last Resort)

If absolutely nothing works:

**Windows:**
```cmd
taskkill /F /IM node.exe
cd TIGER999
rmdir /s /q node_modules
del package-lock.json
rmdir /s /q .expo
rmdir /s /q %TEMP%\metro-*
rmdir /s /q %TEMP%\react-*
npm cache clean --force
npm cache verify
npm install
npx expo start -c
```

**Mac/Linux:**
```bash
killall node
cd TIGER999
rm -rf node_modules package-lock.json .expo
rm -rf /tmp/metro-* /tmp/react-*
npm cache clean --force
npm cache verify
npm install
npx expo start -c
```

---

## 💡 Pro Tips

- **First time?** Always use `npx expo start -c`
- **Reload app:** Press `r` in terminal
- **Clear & reload:** Press `shift + r`
- **Can't scan QR?** Type URL manually in Expo Go
- **Still issues?** Restart phone and computer

---

## 🎉 Success Signs

You'll know it's working when:
1. ✅ No red errors in terminal
2. ✅ "Metro waiting on..." message appears
3. ✅ QR code is visible
4. ✅ App opens on phone
5. ✅ Login screen appears

---

## 📞 Need Help?

If you've followed all steps and still have issues:
1. Check terminal for exact error message
2. Make sure WiFi is working
3. Try restarting Expo Go app
4. Try restarting computer

---

**Remember:** Use `npx expo start -c` every time you start the app for the first few times. The `-c` flag clears cache!

Good luck! 🚀

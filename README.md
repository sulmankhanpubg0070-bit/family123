# خاندانی درخت 🌳 | Family Tree

ایک سادہ اور خوبصورت خاندانی درخت ویب سائٹ

A simple and beautiful family tree website

## خصوصیات | Features

✅ خوبصورت UI/UX ڈیزائن  
✅ اردو اور انگریزی دونوں میں  
✅ Responsive (موبائل اور ڈیسک ٹاپ)  
✅ آسانی سے ترمیم کریں  

## کیسے استعمال کریں | How to Use

### اپنے نام شامل کریں | Add Your Names

**index.html** میں یہ حصہ تبدیل کریں:

```html
<div class="person grandfather">
    <div class="name">احمد علی</div>
    <div class="relation">دادا جان</div>
</div>
```

اپنے نام سے بدلیں:

```html
<div class="person grandfather">
    <div class="name">آپ کا نام</div>
    <div class="relation">آپ کا رشتہ</div>
</div>
```

### نیے ممبر شامل کریں | Add New Members

JavaScript میں یہ کمانڈ استعمال کریں:

```javascript
addFamilyMember('علی', 'بھتیجا', '.level-3');
```

### رنگ بدلیں | Change Colors

**style.css** میں رنگ کوڈ تبدیل کریں۔ مثلاً:

```css
.person {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## فائلوں کی تفصیل | File Structure

- `index.html` - مرکزی صفحہ
- `style.css` - ڈیزائن اور رنگ
- `script.js` - انٹرایکٹیویٹی

## بعد میں Deploy کریں | Deploy Later

GitHub Pages سے آسانی سے شامل کریں:

1. Repo کی **Settings** میں جائیں
2. **Pages** تلاش کریں
3. Branch کو **main** سیٹ کریں
4. Save کریں

---

**محنت سے بنایا گیا** ✨

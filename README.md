# Family Tree Website

Ye simple offline website hai. Sirf browser me `index.html` open karein aur family tree dikh jayega.

## Data edit kaise karein

`app.js` file me:
- `ROOT_ID` me root person ka id set karein
- `PEOPLE` object me apne family members add/edit karein

### Person schema (example)

```js
p10: {
  id: "p10",
  name: "Name Here",
  gender: "M", // "M" / "F" / optional
  birth: "1999", // optional
  note: "optional note",
  partnerId: "p11", // optional
  children: ["p12", "p13"], // optional
}
```

Tip: partner dono taraf set karein (`p10.partnerId="p11"` aur `p11.partnerId="p10"`), aur children list dono me same rakhein (simple consistency).


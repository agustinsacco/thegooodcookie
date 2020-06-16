## Build
`hugo server`

## Bucket Url
http://latitude85-mmcustomltd.s3-website-us-west-2.amazonaws.com

## Optimize images

### Optimize with jpegoptim
```
sudo apt-get install jpegoptim
jpegoptim /wp-content/uploads/**/*.jpg (lossless)
jpegoptim -m80 /wp-content/uploads/**/*.jpg (lossy)
```

### Recursive optimization
```
find . -type f \( -iname "*.jpg" -o -iname "*.jpeg" -iname "*.png" \) -exec jpegoptim -f --strip-all {} \;
```

#### Paypal Test Login

##### Merchant
sb-tfbk81631365@business.example.com
P=C(ob7!

##### Buyer
sb-adut11628494@personal.example.com
7A(k#+fQ
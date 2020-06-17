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

#### Google Sheets

API KEY: AIzaSyCIeEMZzEPCliilY-9N8AHTD4JsYvvwtxE

{"web":{"client_id":"1057333070884-i54im4vrkhfa0pb6dabfhvj0ld386c4e.apps.googleusercontent.com","project_id":"quickstart-1592280285451","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"OJKeVYF9KnIXZCnHZTsoxjLW","javascript_origins":["http://localhost:8000"]}}
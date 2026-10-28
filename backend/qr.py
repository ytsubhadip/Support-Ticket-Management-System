import qrcode

# Website URL
website_url = "https://babu-decoraters.netlify.app/"

# Create QR code
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4
)

qr.add_data(website_url)
qr.make(fit=True)

# Generate image
img = qr.make_image(fill_color="black", back_color="white")

# Save QR code
img.save("website_qrcode.png")

print("QR code generated successfully!")
print("Saved as: website_qrcode.png")   
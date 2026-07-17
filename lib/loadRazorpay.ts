export function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (document.getElementById("razorpay-sdk")) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

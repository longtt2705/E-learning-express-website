tinymce.init({
  selector: "#shortDes",
  height: 300,
  width: 1200,
  plugins: "paste image link autolink lists table media",
  menubar: false,
  toolbar: [
    "undo redo | bold italic underline strikethrough | numlist bullist | alignleft aligncenter alignright | forecolor backcolor | table link image media",
  ],
});
tinymce.init({
  selector: "#detailDes",
  height: 500,
  width: 1200,
  plugins: "paste image link autolink lists table media",
  menubar: false,
  toolbar: [
    "undo redo | bold italic underline strikethrough | numlist bullist | alignleft aligncenter alignright | forecolor backcolor | table link image media",
  ],
});
$("#courseImage").fileinput({
  theme: "fa",
  showUpload: false,
  resizeImage: true,
  maxImageWidth: 1000,
  maxImageHeight: 675,
  minImageWidth: 1000,
  minImageHeight: 675,
  resizePreference: "width",
  dropZoneEnabled: false,
  allowedFileExtensions: ["png", "jpg", "gif"],
});
$("#frmEditCourse").on("submit", function (e) {
  e.preventDefault();

  const course = $("#courseName").val();
  if (course.length === 0) {
    errorMessage("Course's name cannot be empty!");
    return;
  }

  const shortDes = $("#shortDes").val();
  if (shortDes.length === 0) {
    errorMessage("Describe a little about your course first!");
    return;
  }

  const detailDes = $("#detailDes").val();
  if (detailDes.length === 0) {
    errorMessage("Show us what you are going to teach!");
    return;
  }

  const price = $("#price").val();
  if (price.length !== 0) {
    const isNum = /^\d+$/.test(price);
    if (!isNum) {
      errorMessage("Price must be a number!");
      return;
    } else if (+price < 0) {
      errorMessage("Price must be a postitive number!");
      return;
    }
  } else {
    errorMessage("Price cannot be empty");
    return;
  }

  const discount = $("#discount").val();
  if (discount.length !== 0) {
    const isNum = /^\d+$/.test(discount);
    if (!isNum) {
      errorMessage("Discount must be a number!");
      return;
    } else if (+discount < 0) {
      errorMessage("Discount must be a postitive number!");
      return;
    }
  }

  const courseId = $("#courseName").data("id");
  $.getJSON(
    `/teacher/course/is-rename-available?courseName=${course}&courseId=${courseId}`,
    function (data) {
      if (data === true) {
        $("#frmEditCourse").off("submit").submit();
      } else {
        errorMessage("Your course name has already existed!");
      }
    }
  );
});

function errorMessage(message) {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message,
  });
}

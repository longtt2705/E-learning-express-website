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

  allowedFileExtensions: ["png", "jpg", "gif"],
});

localStorage.setItem("totalChapter", 0);

$("#addNewChapter").on("click", function (e) {
  localStorage.setItem(
    "totalChapter",
    +localStorage.getItem("totalChapter") + 1
  );
  let id = localStorage.getItem("totalChapter");
  e.preventDefault();
  $("#chapter-area").append(`
        <div class="card shadow" id="chapter-${id}">
            <div class="card-header" style="background-color: #d82a4e; color: white;">
              <div class="row">
                  <div class="col-sm-11 row">
                    <label class="col-sm-2" for="chapter-${id}">Chapter ${id}</label>
                    <input type="text" class="form-control col-sm-10 chapter" name="chapter-${id}">
                  </div>
                  <div class="col-sm-1">
                      <button type="button" id="close-chapter-${id}" class="close" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                  </div>
              </div>
            </div>
            <div class="card-body">
                <div id="lesson-area-${id}">
                </div>
                <div class="my-3">
                    <button id="addNewLesson-${id}" class="btn btn-danger">Add new lesson</button>
                </div>
            </div>
        </div>`);

  $(`#close-chapter-${id}`).on("click", function (e) {
    $(`#chapter-${id}`).fadeOut(500, function () {
      $(this).remove();
    });
  });

  localStorage.setItem(`totalLesson${id}`, 0);

  $(`#addNewLesson-${id}`).on("click", function (e) {
    e.preventDefault();

    let chapterId = +$(this).attr("id").split("-")[1];
    localStorage.setItem(
      `totalLesson${chapterId}`,
      +localStorage.getItem(`totalLesson${chapterId}`) + 1
    );
    let lessonId = +localStorage.getItem(`totalLesson${chapterId}`);

    $(`#lesson-area-${chapterId}`).append(`
    <div id="lesson-${chapterId}-${lessonId}" class="my-3 card shadow">
      <div class="card-header" style="background-color: #d82a4e; color: white;">
        <div class="row">
          <div class="col-sm-11 row">
            <label class="col-sm-2" for="lesson-${chapterId}-${lessonId}">Lesson ${lessonId}</label>
            <input id="lessonName-${chapterId}-${lessonId}" type="text" class="form-control mb-2 col-sm-10 lesson" name="lessonName-${chapterId}-${lessonId}">
          </div>
          <div class="col-sm-1">
              <button type="button" class="close" id="close-${chapterId}-${lessonId}" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
              </button>
          </div>
        </div>
      </div>
      <div class="card-body">
        <input id="video-${chapterId}-${lessonId}" type="file" class="file" data-preview-file-type="text" name="video-${chapterId}-${lessonId}"></input>
      </div>
    </div>
    `);

    $(`#close-${chapterId}-${lessonId}`).on("click", function (e) {
      $(`#lesson-${chapterId}-${lessonId}`).fadeOut(500, function () {
        $(this).remove();
      });
    });

    $(`#video-${chapterId}-${lessonId}`).fileinput({
      theme: "fa",
      showUpload: false,
      dropZoneEnabled: false,
      allowedFileExtensions: ["mp4", "mkv"],
    });
  });
});

$("#frmAddCourse").on("submit", function (e) {
  e.preventDefault();

  const course = $("#courseName").val();
  if (course.length === 0) {
    errorMessage("Course's name cannot be empty!");
    return;
  }

  if (document.getElementById("courseImage").files.length == 0) {
    errorMessage("You need to add an image for your course!");
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

  let hasError = false;
  const chapterNames = {};
  $(".chapter").each(function (index) {
    const chapterName = $(this).val();
    if (chapterName.length === 0) {
      hasError = true;
      errorMessage("Chapter's name cannot be empty!");
      return;
    } else {
      if (chapterNames.hasOwnProperty(chapterName)) {
        hasError = true;
        errorMessage("Chapter's name must be different from the other ones!");
        return;
      } else {
        chapterNames[chapterName] = true;
      }
    }
  });

  $(".lesson").each(function (index) {
    const lessonName = $(this).val();
    if (lessonName.length === 0) {
      hasError = true;

      errorMessage("Lesson's name cannot be empty!");
      return;
    } else {
      const splitedId = $(this).attr("id").split("-");

      $(`#video-${splitedId[1]}-${splitedId[2]}`).attr("name", lessonName);
    }
  });

  if (!hasError) {
    $.getJSON(
      `/teacher/course/is-available?courseName=${course}`,
      function (data) {
        if (data === true) {
          $("#frmAddCourse").off("submit").submit();
        } else {
          errorMessage("Your course name has already existed!");
        }
      }
    );
  }
});

function errorMessage(message) {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message,
  });
}

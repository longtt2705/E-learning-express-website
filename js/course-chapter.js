$(".close").on("click", function (e) {
  console.log("delete");
});

$(".video").each(function (e) {
  $(`#${$(this).attr("id")}`).fileinput({
    theme: "fa",
    showUpload: false,
    dropZoneEnabled: false,
    allowedFileExtensions: ["mp4"],
  });
});

$("#frmContent").on("submit", function (e) {
  e.preventDefault();

  let hasError = false;

  const chapterName = $("#chapter").val();
  if (chapterName.length === 0) {
    errorMessage("Chapter's name cannot be empty!");
    return;
  }

  const lessonNames = {};
  $(`.lesson`).each(function (i) {
    const lessonName = $(this).val();

    if (lessonName.length === 0) {
      hasError = true;
      errorMessage("Lesson's name cannot be empty!");
      return;
    } else {
      if (lessonNames.hasOwnProperty(lessonName)) {
        hasError = true;
        errorMessage(
          "Lesson's name in the same chapter must be different from the other ones!"
        );
        return;
      } else {
        lessonNames[lessonName] = true;
        $(`#video-${$(this).attr("id")}`).attr(
          "name",
          $(this).attr("id") + "-" + lessonName
        );
      }
    }
  });
  if (!hasError) {
    const courseId = $("#chapter").data("course");
    const chapterId = $("#chapter").data("id");

    $.getJSON(
      `/teacher/contents/is-available?courseId=${courseId}&chapterName=${chapterName}&chapterId=${chapterId}`,
      function (data) {
        if (data === true) {
          $("#frmContent").off("submit").submit();
        } else {
          errorMessage("Your chapter name has already existed!");
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

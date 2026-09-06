$(document).ready(function () {

    // -----------------------------
    // LOGIN / REGISTER PAGE
    // -----------------------------

    const container = $("<div>");

    const heading = $("<h1>")
        .text("Notes Management");

    const nameInput = $("<input>")
        .attr("type", "text")
        .attr("placeholder", "Name")
        .attr("id", "name");

    const emailInput = $("<input>")
        .attr("type", "email")
        .attr("placeholder", "Email")
        .attr("id", "email");

    const passwordInput = $("<input>")
        .attr("type", "password")
        .attr("placeholder", "Password")
        .attr("id", "password");

    const registerButton = $("<button>")
        .text("Register")
        .attr("id", "registerBtn");

    const loginButton = $("<button>")
        .text("Login")
        .attr("id", "loginBtn");

    const message = $("<p>")
        .attr("id", "message");

    container.append(
        heading,
        $("<br>"),
        nameInput,
        $("<br>"),
        emailInput,
        $("<br>"),
        passwordInput,
        $("<br>"),
        registerButton,
        $("<br>"),
        loginButton,
        message
    );

    $("body").append(container);


    // -----------------------------
    // REGISTER
    // -----------------------------

    $("#registerBtn").click(function () {

        const userData = {
            name: $("#name").val(),
            email: $("#email").val(),
            password: $("#password").val()
        };

        $.ajax({
            url: "/api/register",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(userData),

            success: function (response) {
                $("#message").text(response.message);
            },

            error: function (xhr) {
                $("#message").text(
                    xhr.responseJSON?.message || "Registration failed"
                );
            }
        });

    });


    // -----------------------------
    // LOGIN
    // -----------------------------

    $("#loginBtn").click(function () {

        const loginData = {
            email: $("#email").val(),
            password: $("#password").val()
        };

        $.ajax({
            url: "/api/login",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(loginData),

            success: function (response) {

                $("#message").text(
                    "Welcome " + response.user.name
                );

                showNotesPage();

            },

            error: function (xhr) {
                $("#message").text(
                    xhr.responseJSON?.message || "Login failed"
                );
            }
        });

    });


    // -----------------------------
    // NOTES PAGE
    // -----------------------------

    function showNotesPage() {

        $("body").empty();

        const notesContainer = $("<div>");

        const notesHeading = $("<h1>")
            .text("My Notes");

        const titleInput = $("<input>")
            .attr("type", "text")
            .attr("placeholder", "Note title")
            .attr("id", "noteTitle");

        const contentInput = $("<textarea>")
            .attr("placeholder", "Write your note")
            .attr("id", "noteContent");

        const createNoteButton = $("<button>")
            .text("Create Note")
            .attr("id", "createNoteBtn");

        const viewNotesButton = $("<button>")
            .text("View Notes")
            .attr("id", "viewNotesBtn");

        const logoutButton = $("<button>")
            .text("Logout")
            .attr("id", "logoutBtn");

        const notesList = $("<div>")
            .attr("id", "notesList");

        const notesMessage = $("<p>")
            .attr("id", "notesMessage");

        notesContainer.append(
            notesHeading,
            $("<br>"),
            titleInput,
            $("<br>"),
            contentInput,
            $("<br>"),
            createNoteButton,
            $("<br>"),
            viewNotesButton,
            $("<br>"),
            logoutButton,
            notesMessage,
            notesList
        );

        $("body").append(notesContainer);

        loadNotes();
    }


    // -----------------------------
    // CREATE NOTE
    // -----------------------------

    $(document).on("click", "#createNoteBtn", function () {

        const noteData = {
            title: $("#noteTitle").val(),
            content: $("#noteContent").val()
        };

        $.ajax({
            url: "/api/notes",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(noteData),

            success: function (response) {

                $("#notesMessage").text(response.message);

                $("#noteTitle").val("");
                $("#noteContent").val("");

                loadNotes();
            },

            error: function (xhr) {
                $("#notesMessage").text(
                    xhr.responseJSON?.message || "Failed to create note"
                );
            }
        });

    });


    // -----------------------------
    // VIEW NOTES
    // -----------------------------

    $(document).on("click", "#viewNotesBtn", function () {
        loadNotes();
    });


    function loadNotes() {

        $.ajax({
            url: "/api/notes",
            method: "GET",

            success: function (notes) {

                $("#notesList").empty();

                if (notes.length === 0) {
                    $("#notesList").append(
                        $("<p>").text("No notes found")
                    );
                    return;
                }

                notes.forEach(function (note) {

                    const noteDiv = $("<div>");

                    const title = $("<h3>")
                        .text(note.title);

                    const content = $("<p>")
                        .text(note.content);

                    noteDiv.append(
                        title,
                        content,
                        $("<hr>")
                    );

                    $("#notesList").append(noteDiv);
                });
            },

            error: function (xhr) {

                $("#notesMessage").text(
                    xhr.responseJSON?.message || "Failed to load notes"
                );
            }
        });
    }


    // -----------------------------
    // LOGOUT
    // -----------------------------

    $(document).on("click", "#logoutBtn", function () {

        $.ajax({
            url: "/api/logout",
            method: "POST",

            success: function (response) {

                $("body").empty();

                $("body").append(
                    $("<p>").text(response.message)
                );

                location.reload();
            },

            error: function (xhr) {

                $("#notesMessage").text(
                    xhr.responseJSON?.message || "Logout failed"
                );
            }
        });

    });

});
exports.getHome = (req, res) => {
    res.render('student/home');
};

exports.getActivities = (req, res) => {
    res.render('student/activities');
};

exports.getCapstoneProjects = (req, res) => {
    res.render('student/capstone-projects');
};

exports.getGroup = (req, res) => {
    res.render('student/group');
};


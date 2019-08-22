# Download videos (course) from coursehunter.net

# How to install (Node.js and git required):

```sh
git clone https://github.com/alekseylovchikov/ch-download.git
cd ch-download
npm install
```

# How to use:

### Download premium courses (required paid subscription)

```sh
coursehunters -u course-url -e email -p password [-d dirname] [-l lessons]
```

### Download free courses

```sh
coursehunters -u course-url [-d dirname] [-l lessons]
```

### Arguments:

```sh
-e: email for login
-p: password for login
-u, --url: https://coursehunter.net/course_name
-d, --dir: download folder, default <course_name>
-l, --lessons: download only listed lessons, e.g.: "1-5, 7, 10, 12-15" or 3-7,9,11,15-20
```

### How to videos:

[Download free courses](https://www.youtube.com/watch?v=-sFqEquzMbE)

# Authors:

-   [alekseylovchikov](https://github.com/alekseylovchikov)
-   [SergeiKaptelin](https://github.com/SergeiKaptelin)

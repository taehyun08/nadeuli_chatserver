pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                script {
                    // 디렉토리 변경
                        // 이 안에서 실행할 명령어나 스크립트 작성
                            // 여기에 npm install 등의 명령어 작성
                            sh 'npm install'
                            sh 'node app.js'
                        }
                    }
                }
            }
        }
    }
}
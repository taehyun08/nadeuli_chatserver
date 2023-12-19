pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                script {
                    // 디렉토리 변경
                    dir('/var/lib/jenkins/workspace/nadeuliChatpp') {
                        // 이 안에서 실행할 명령어나 스크립트 작성
                        nodejs(nodeJSInstallationName: 'NodeJS_20.9.0', configId: null) {
                            // 여기에 npm install 등의 명령어 작성
                            sh 'npm install'
                        }
                    }
                }
            }
        }
    }
}
pipeline {
    agent any

    stages {
        stage('Build and Deploy Docker') {
            when {
                expression { currentBuild.resultIsBetterOrEqualTo('UNSTABLE') }
            }
            steps {
                script {
                    // Docker 이미지 빌드
                    dir('/var/lib/jenkins/workspace/nadeuliChatpp') {
                        sh 'sudo docker build -t lsm00/nadeulichat:latest .'
                    }

                    // 이전에 실행 중이던 도커 컨테이너 중지 및 삭제
                    def existingContainerId = sh(script: 'docker ps -aq --filter name=nadeulichat', returnStdout: true).trim()
                    if (existingContainerId) {
                        sh "docker stop $existingContainerId"
                        sh "docker rm $existingContainerId"
                    }

                    // 새로운 도커 컨테이너 실행 (SSL 인증서 마운트)
                    sh 'docker run -d --name nadeulichat -p 81:3001 -v /etc/letsencrypt/archive:/config/ -u root lsm00/nadeulichat:latest'

                    withCredentials([string(credentialsId: 'docker_hub_access_token', variable: 'DOCKERHUB_ACCESS_TOKEN')]) {
                        // Docker Hub에 로그인하고 이미지 푸시
                        sh "docker login -u lsm00 -p $DOCKERHUB_ACCESS_TOKEN"
                        sh "docker push lsm00/nadeulichat:latest"
                    }

                    // Docker 이미지가 있는지 확인
                    def danglingImages = sh(script: 'sudo docker images -q -f "dangling=true" | wc -l', returnStdout: true).trim()

                    if (danglingImages != '0') {
                        sh 'sudo docker rmi -f $(sudo docker images -q -f "dangling=true")'
                    } else {
                        echo '삭제할 로컬 이미지가 없습니다.'
                    }
                }
            }
        }

        stage("Slack Notification") {
            when {
                expression { currentBuild.resultIsBetterOrEqualTo('UNSTABLE') }
            }
            steps {
                echo 'Slack 통지 테스트'
            }
            post {
                success {
                    slackSend channel: '#jenkins', color: 'good', message: "Chat 배포 성공"
                }
                failure {
                    slackSend channel: '#jenkins', color: 'danger', message: "Chat 배포 실패"
                }
            }
        }
    }
}


from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuestionViewSet, AnswerViewSet, QuizAttemptViewSet

router = DefaultRouter()
router.register(r'', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet)
router.register(r'answers', AnswerViewSet)
router.register(r'attempts', QuizAttemptViewSet, basename='attempt')

urlpatterns = [
    path('', include(router.urls)),
]
